export async function POST(req) {
  try {
    const { endpoint } = await req.json();

    // Remove subscription from your database
    // Example with Supabase:
    // const { error } = await supabase
    //   .from('push_subscriptions')
    //   .delete()
    //   .eq('endpoint', endpoint);

    console.log('Removed push subscription:', endpoint);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error removing subscription:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
