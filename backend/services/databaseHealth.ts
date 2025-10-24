import { supabase } from '../supabase';

/**
 * Check if the user_credits table exists and is accessible
 */
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  hasUserCreditsTable: boolean;
  error?: string;
}> {
  try {
    // Try to query the user_credits table
    const { data, error } = await supabase
      .from('user_credits')
      .select('id')
      .limit(1);

    if (error) {
      // Check if it's a missing table error
      if (error.code === 'PGRST205' || /table .* not found|schema cache/i.test(error.message || '')) {
        console.warn('⚠️  Database tables not found. Please apply migrations.');
        console.warn('   See APPLY_MIGRATIONS.md for instructions.');
        return {
          isHealthy: false,
          hasUserCreditsTable: false,
          error: 'user_credits table not found - migrations need to be applied'
        };
      }

      // Other database error
      return {
        isHealthy: false,
        hasUserCreditsTable: false,
        error: error.message
      };
    }

    // Success - table exists and is accessible
    console.log('✅ Database connection healthy - user_credits table exists');
    return {
      isHealthy: true,
      hasUserCreditsTable: true
    };
  } catch (error: any) {
    console.error('❌ Database health check failed:', error.message);
    return {
      isHealthy: false,
      hasUserCreditsTable: false,
      error: error.message
    };
  }
}

/**
 * Get database status for API endpoint
 */
export async function getDatabaseStatus() {
  const health = await checkDatabaseHealth();
  
  return {
    configured: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY,
    healthy: health.isHealthy,
    tablesExist: health.hasUserCreditsTable,
    error: health.error,
    usingMemoryFallback: !health.isHealthy
  };
}
