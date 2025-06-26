
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const cohereApiKey = Deno.env.get('COHERE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, cvText } = await req.json();
    
    console.log('Enhancing CV with Cohere for document:', documentId);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call Cohere API to enhance the CV
    const cohereResponse = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cohereApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command',
        prompt: `Please enhance this CV by improving the content, structure, and language. Make it more professional and ATS-friendly. Add relevant keywords and improve descriptions. Format the response as JSON with the following structure:
        {
          "personalInfo": {
            "name": "Full Name",
            "email": "email@example.com",
            "phone": "phone number",
            "location": "City, Country",
            "summary": "Professional summary paragraph"
          },
          "experience": [
            {
              "title": "Job Title",
              "company": "Company Name",
              "duration": "Start Date - End Date",
              "description": "Enhanced job description with achievements"
            }
          ],
          "education": [
            {
              "degree": "Degree Name",
              "institution": "Institution Name",
              "year": "Year",
              "details": "Additional details"
            }
          ],
          "skills": ["skill1", "skill2", "skill3"],
          "improvements": ["List of improvements made"]
        }

        Original CV text:
        ${cvText}`,
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!cohereResponse.ok) {
      throw new Error(`Cohere API error: ${cohereResponse.statusText}`);
    }

    const cohereData = await cohereResponse.json();
    const enhancedContent = cohereData.generations[0].text;

    console.log('Cohere response received, parsing JSON...');

    // Parse the JSON response from Cohere
    let parsedContent;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = enhancedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in Cohere response');
      }
    } catch (parseError) {
      console.error('Error parsing Cohere JSON:', parseError);
      // Fallback: create a basic structure
      parsedContent = {
        personalInfo: {
          name: "Enhanced CV",
          summary: "This CV has been enhanced with AI improvements"
        },
        improvements: ["Content enhancement", "Professional formatting", "ATS optimization"],
        rawContent: enhancedContent
      };
    }

    // Update the document with the enhanced content
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        analysis_json: parsedContent,
      })
      .eq('id', documentId);

    if (updateError) {
      throw new Error(`Database update error: ${updateError.message}`);
    }

    console.log('Document updated successfully with enhanced content');

    return new Response(JSON.stringify({
      success: true,
      enhancedContent: parsedContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhance-cv-with-cohere function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
