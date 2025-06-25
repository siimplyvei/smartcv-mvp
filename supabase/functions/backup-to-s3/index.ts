
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
}

async function uploadToS3(fileContent: Uint8Array, key: string, contentType: string, config: S3Config) {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify({
    bucket: config.bucket,
    key: key,
    content: Array.from(fileContent),
    contentType: contentType
  }));

  // Using AWS SDK v3 compatible approach
  const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const dateStamp = timestamp.substr(0, 8);
  
  const host = `${config.bucket}.s3.${config.region}.amazonaws.com`;
  const url = `https://${host}/${key}`;
  
  // Simple PUT request to S3 (you might want to implement proper AWS Signature v4)
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      'Content-Length': fileContent.length.toString(),
    },
    body: fileContent,
  });

  return response.ok;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { documentId, filePath } = await req.json();
    
    // Get AWS credentials from Supabase secrets
    const awsAccessKey = Deno.env.get('AWS_ACCESS_KEY_ID');
    const awsSecretKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const awsRegion = Deno.env.get('AWS_REGION') || 'us-east-1';
    const awsBucket = Deno.env.get('AWS_S3_BUCKET') || 'smartcv-backup';

    if (!awsAccessKey || !awsSecretKey) {
      throw new Error('AWS credentials not configured');
    }

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('cv-files')
      .download(filePath);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Convert file to Uint8Array
    const fileContent = new Uint8Array(await fileData.arrayBuffer());
    
    // Generate S3 key
    const s3Key = `backups/${documentId}/${filePath.split('/').pop()}`;
    
    // Upload to S3
    const s3Config: S3Config = {
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretKey,
      region: awsRegion,
      bucket: awsBucket
    };

    const uploadSuccess = await uploadToS3(fileContent, s3Key, 'application/pdf', s3Config);
    
    if (uploadSuccess) {
      // Update document record
      const { error: updateError } = await supabaseClient
        .from('documents')
        .update({ 
          backed_up_to_s3: true,
          s3_key: s3Key 
        })
        .eq('id', documentId);

      if (updateError) {
        console.error('Failed to update document record:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: uploadSuccess,
        s3Key: uploadSuccess ? s3Key : null 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: uploadSuccess ? 200 : 500
      }
    );

  } catch (error) {
    console.error('Error in backup-to-s3 function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
