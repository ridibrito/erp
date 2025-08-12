import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentMember } from '@/lib/session';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const member = await getCurrentMember();
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const calendar_id = searchParams.get('calendar_id');

    if (!from || !to) {
      return NextResponse.json({ error: 'from and to parameters are required' }, { status: 400 });
    }

    // Construir query base
    let query = supabase
      .from('v_calendar_events')
      .select('*')
      .eq('org_id', member.org_id)
      .gte('starts_at', from)
      .lte('ends_at', to);

    // Filtrar por calendário se especificado
    if (calendar_id) {
      query = query.eq('calendar_id', calendar_id);
    }

    const { data: events, error } = await query.order('starts_at', { ascending: true });

    if (error) {
      console.error('Error fetching calendar events:', error);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: events 
    });

  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const member = await getCurrentMember();
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      calendar_id, 
      title, 
      description, 
      location, 
      all_day, 
      starts_at, 
      ends_at, 
      attendees 
    } = body;

    // Validações básicas
    if (!calendar_id || !title || !starts_at || !ends_at) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verificar se o calendário pertence à organização
    const { data: calendar } = await supabase
      .from('cal_calendars')
      .select('id')
      .eq('id', calendar_id)
      .eq('org_id', member.org_id)
      .single();

    if (!calendar) {
      return NextResponse.json({ error: 'Calendar not found' }, { status: 404 });
    }

    // Criar evento
    const { data: event, error: eventError } = await supabase
      .from('cal_events')
      .insert({
        org_id: member.org_id,
        calendar_id,
        title,
        description,
        location,
        all_day: all_day || false,
        starts_at,
        ends_at,
        kind: 'general',
        created_by: member.user_id
      })
      .select()
      .single();

    if (eventError) {
      console.error('Error creating event:', eventError);
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }

    // Adicionar participantes se especificados
    if (attendees && attendees.length > 0) {
      const attendeeData = attendees.map((attendee: any) => ({
        org_id: member.org_id,
        event_id: event.id,
        user_id: attendee.user_id,
        contact_id: attendee.contact_id,
        email: attendee.email,
        role: attendee.role || 'required'
      }));

      const { error: attendeeError } = await supabase
        .from('cal_event_attendees')
        .insert(attendeeData);

      if (attendeeError) {
        console.error('Error adding attendees:', attendeeError);
        // Não falhar se apenas os participantes derem erro
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: event 
    });

  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
