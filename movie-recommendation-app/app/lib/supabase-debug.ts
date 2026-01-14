// Debug utility to test Supabase connection
import { supabase, isSupabaseConfigured } from './supabase';

export async function testSupabaseConnection() {
  console.log('=== Supabase Connection Test ===');
  
  if (!isSupabaseConfigured()) {
    console.log('❌ Supabase is NOT configured');
    console.log('   Check your .env.local file for:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return { success: false, reason: 'Not configured' };
  }
  
  console.log('✅ Supabase is configured');
  
  // Test 1: Check authentication
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.log('❌ Error getting user:', userError);
      return { success: false, reason: 'Auth error', error: userError };
    }
    
    if (!user) {
      console.log('⚠️ No user found - trying to create anonymous session...');
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
      
      if (authError) {
        console.log('❌ Failed to create anonymous session:', authError);
        console.log('💡 Make sure Anonymous authentication is enabled in Supabase');
        return { success: false, reason: 'Anonymous auth failed', error: authError };
      }
      
      console.log('✅ Anonymous user created:', authData.user?.id);
      return { success: true, userId: authData.user?.id, isAnonymous: true };
    }
    
    console.log('✅ User found:', user.id);
    console.log('   Is anonymous:', user.is_anonymous);
    return { success: true, userId: user.id, isAnonymous: user.is_anonymous };
  } catch (error) {
    console.log('❌ Auth test failed:', error);
    return { success: false, reason: 'Auth test failed', error };
  }
}

export async function testSupabaseTable() {
  console.log('=== Supabase Table Test ===');
  
  if (!isSupabaseConfigured()) {
    return { success: false, reason: 'Not configured' };
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, reason: 'No user' };
  }
  
  try {
    // Try to read from the table
    const { data, error } = await supabase
      .from('watched_movies')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Table read error:', error);
      console.log('   Code:', error.code);
      console.log('   Message:', error.message);
      
      if (error.code === 'PGRST301' || error.message?.includes('permission denied')) {
        console.log('💡 RLS Policy Issue: Check your Row Level Security policies');
      } else if (error.code === '42P01') {
        console.log('💡 Table doesn\'t exist: Run supabase-schema.sql');
      }
      
      return { success: false, reason: 'Table read failed', error };
    }
    
    console.log('✅ Table is accessible');
    console.log('   Sample data:', data);
    return { success: true, data };
  } catch (error) {
    console.log('❌ Table test failed:', error);
    return { success: false, reason: 'Table test failed', error };
  }
}

export async function testSupabaseWrite(movieId: number = 999999) {
  console.log('=== Supabase Write Test ===');
  
  if (!isSupabaseConfigured()) {
    return { success: false, reason: 'Not configured' };
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, reason: 'No user' };
  }
  
  try {
    const testData = {
      user_id: user.id,
      movie_id: movieId,
      watched_at: new Date().toISOString(),
      might_watch_again: false,
    };
    
    console.log('Attempting to write:', testData);
    
    const { data, error } = await supabase
      .from('watched_movies')
      .upsert(testData, {
        onConflict: 'user_id,movie_id'
      });
    
    if (error) {
      console.log('❌ Write error:', error);
      console.log('   Code:', error.code);
      console.log('   Message:', error.message);
      console.log('   Details:', error.details);
      console.log('   Hint:', error.hint);
      return { success: false, reason: 'Write failed', error };
    }
    
    console.log('✅ Write successful!');
    console.log('   Response:', data);
    
    // Clean up test data
    await supabase
      .from('watched_movies')
      .delete()
      .eq('user_id', user.id)
      .eq('movie_id', movieId);
    
    console.log('✅ Test data cleaned up');
    return { success: true, data };
  } catch (error) {
    console.log('❌ Write test failed:', error);
    return { success: false, reason: 'Write test failed', error };
  }
}

// Run all tests
export async function runAllTests() {
  console.log('\n🔍 Running Supabase Diagnostics...\n');
  
  const connectionTest = await testSupabaseConnection();
  if (!connectionTest.success) {
    return connectionTest;
  }
  
  const tableTest = await testSupabaseTable();
  if (!tableTest.success) {
    return tableTest;
  }
  
  const writeTest = await testSupabaseWrite();
  if (!writeTest.success) {
    return writeTest;
  }
  
  console.log('\n✅ All tests passed! Supabase is working correctly.\n');
  return { success: true };
}
