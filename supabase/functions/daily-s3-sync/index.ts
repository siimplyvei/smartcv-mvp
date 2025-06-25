
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all documents that haven't been backed up to S3
    const { data: documents, error: queryError } = await supabaseClient
      .from('documents')
      .select('*')
      .eq('backed_up_to_s3', false);

    if (queryError) {
      throw new Error(`Failed to query documents: ${queryError.message}`);
    }

    console.log(`Found ${documents?.length || 0} documents to backup`);

    const backupResults = [];

    for (const doc of documents || []) {
      try {
        // Call the backup function for each document
        const backupResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/backup-to-s3`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            documentId: doc.id,
            filePath: doc.file_url.split('/').pop() // Extract filename from URL
          })
        });

        const result = await backupResponse.json();
        backupResults.push({
          documentId: doc.id,
          success: result.success,
          error: result.error
        });

        console.log(`Backup for document ${doc.id}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      } catch (error) {
        console.error(`Failed to backup document ${doc.id}:`, error);
        backupResults.push({
          documentId: doc.id,
          success: false,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Daily S3 sync completed',
        totalDocuments: documents?.length || 0,
        results: backupResults
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in daily-s3-sync function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
