import { supabase } from './supabase';

export async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test 1: Check if we can connect to Supabase
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
      
    if (healthError) {
      console.error('❌ Database connection failed:', healthError);
      return { success: false, error: healthError.message };
    }
    
    console.log('✅ Database connection successful');
    
    // Test 2: Try to insert a test profile
    const testWallet = '0xTEST123456789';
    
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .upsert({
        wallet_address: testWallet,
        first_name: 'Test',
        last_name: 'User',
        blockchain_network: 'flow-testnet',
        is_active: true,
        profile_complete: false
      })
      .select();
      
    if (insertError) {
      console.error('❌ Test insert failed:', insertError);
      return { success: false, error: insertError.message };
    }
    
    console.log('✅ Test profile created:', insertData);
    
    // Test 3: Clean up test data
    await supabase
      .from('profiles')
      .delete()
      .eq('wallet_address', testWallet);
      
    console.log('✅ Test cleanup completed');
    
    return { success: true, message: 'Database is working properly!' };
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}