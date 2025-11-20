/**
 * Supabase Client Configuration
 * Initializes and exports the Supabase client with proper error handling
 */

const { createClient } = require('@supabase/supabase-js');
const { getSecret } = require('./secretManager');

let supabaseInstance = null;

// Initialize Supabase client asynchronously
const initSupabase = async () => {
    const supabaseUrl = await getSecret('SUPABASE_URL');
    const supabaseKey = await getSecret('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase credentials missing. Please check Secret Manager or .env file.');
        // We might want to throw here or handle it gracefully depending on app startup requirements
    }

    return createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
        db: {
            schema: 'public',
        },
        global: {
            headers: {
                'x-application-name': 'ai-lead-iq',
            },
        },
    });
};

const getSupabase = async () => {
    if (!supabaseInstance) {
        supabaseInstance = await initSupabase();
    }
    return supabaseInstance;
};

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection is successful
 */
async function testConnection() {
    try {
        const supabase = await getSupabase();
        const { data, error } = await supabase.from('leads').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Supabase connection test failed:', error.message);
            return false;
        }

        console.log('✅ Supabase connection successful');
        return true;
    } catch (err) {
        console.error('❌ Supabase connection error:', err.message);
        return false;
    }
}

/**
 * Generic error handler for Supabase operations
 * @param {Object} error - Supabase error object
 * @param {string} operation - Description of the operation
 * @throws {Error} Formatted error with context
 */
function handleSupabaseError(error, operation = 'Database operation') {
    const errorMessage = `${operation} failed: ${error.message}`;
    console.error(`❌ ${errorMessage}`, error);
    throw new Error(errorMessage);
}

/**
 * Query builder helper with error handling
 * @param {string} table - Table name
 * @returns {Promise<Object>} Supabase query builder
 */
async function query(table) {
    const supabase = await getSupabase();
    return supabase.from(table);
}

/**
 * Execute a query with automatic error handling
 * @param {Promise} queryPromise - Supabase query promise
 * @param {string} operation - Description of the operation
 * @returns {Promise<Object>} Query result data
 */
async function executeQuery(queryPromise, operation = 'Query') {
    const { data, error } = await queryPromise;

    if (error) {
        handleSupabaseError(error, operation);
    }

    return data;
}

/**
 * Health check for Supabase connection
 * @returns {Promise<Object>} Health status
 */
async function healthCheck() {
    try {
        const isConnected = await testConnection();
        const supabaseUrl = await getSecret('SUPABASE_URL');
        return {
            status: isConnected ? 'healthy' : 'unhealthy',
            service: 'supabase',
            timestamp: new Date().toISOString(),
            url: supabaseUrl,
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            service: 'supabase',
            timestamp: new Date().toISOString(),
            error: error.message,
        };
    }
}

module.exports = {
    getSupabase,
    testConnection,
    handleSupabaseError,
    query,
    executeQuery,
    healthCheck,
};
