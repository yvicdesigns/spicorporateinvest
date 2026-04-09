import { supabase } from '../lib/customSupabaseClient';

/**
 * Utility to log the exact schema and a sample product record to the console
 */
export const logProductSchema = async () => {
  console.log('--- PRODUCTS TABLE SCHEMA & SAMPLE ---');
  console.log('Exact Table Name: products');
  console.log('Primary Key: id (uuid)');
  console.log('Columns:');
  console.log('  - id (uuid, NOT NULL)');
  console.log('  - branch_id (text, NOT NULL)');
  console.log('  - name (text, NOT NULL)');
  console.log('  - description (text)');
  console.log('  - price (numeric)');
  console.log('  - image_url (text)');
  console.log('  - product_type (text)');
  console.log('  - category (text)');
  console.log('  - is_active (boolean)');
  console.log('  - created_at (timestamp with time zone)');
  console.log('  - updated_at (timestamp with time zone)');

  // Fetch a real sample record
  try {
    const { data: sampleRecord, error } = await supabase
      .from('products')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      console.error('\nError fetching sample record:', error.message);
    } else if (sampleRecord) {
      console.log('\nSample Product Record:');
      console.log(JSON.stringify(sampleRecord, null, 2));
      console.log('\nExact Image URL:', sampleRecord.image_url);
    } else {
      console.log('\nNo sample records found in the products table.');
    }
  } catch (err) {
    console.error('Unexpected error fetching sample:', err);
  }
};

/**
 * Utility demonstrating the exact Supabase JS query syntax to fetch a product by ID
 * @param {string} productId 
 */
export const getProductById = async (productId) => {
  // EXAMLE of Exact Supabase JS syntax:
  // supabase.from('products').select('*').eq('id', productId).single()
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
    
  return { data, error };
};