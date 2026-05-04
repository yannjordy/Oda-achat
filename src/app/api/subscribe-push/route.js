export async function POST(req) {
  try {
    const subscription = await req.json();

    // Store subscription in your database
    // Example with Supabase:
    // const { error } = await supabase
    //   .from('push_subscriptions')
    //   .upsert({
    //     endpoint: subscription.endpoint,
    //     keys: subscription.keys,
    //     user_id: subscription.userId,
    //     created_at: new Date().toISOString()
    //   });

    // For now, just log it
    console.log('New push subscription:', subscription.endpoint);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error saving subscription:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
