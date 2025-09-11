import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

interface ProcessPromptRequest {
  rawText: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  adminId: string;
  typeId?: string;
  modelId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rawText, category, subcategory, tags, adminId, typeId, modelId }: ProcessPromptRequest = await req.json();

    console.log('Processing prompt for category:', category);

    // Use OpenAI to process the raw text into structured prompt templates
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a prompt engineering assistant. Your task is to analyze raw text and extract actionable prompt templates with appropriate placeholders.

Categories and their typical placeholders:
- Development & Code Execution: {language}, {code_snippet}, {error_message}, {function_name}, {framework}
- Research & Knowledge Work: {topic}, {research_question}, {source_type}, {domain}, {timeframe}
- Creative & Design: {style}, {medium}, {theme}, {target_audience}, {dimensions}
- Business & Marketing: {product}, {target_market}, {goal}, {budget}, {timeline}

Return a JSON array of template objects with this structure:
{
  "template_text": "optimized prompt with {placeholders}",
  "placeholders": ["placeholder1", "placeholder2"],
  "description": "brief description of what this template does",
  "priority": 1-10 (10 being highest priority)
}`
          },
          {
            role: 'user',
            content: `Category: ${category}
${subcategory ? `Subcategory: ${subcategory}` : ''}
${tags?.length ? `Tags: ${tags.join(', ')}` : ''}

Raw text to process:
${rawText}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    let processedContent = aiResponse.choices[0].message.content;
    
    // Remove markdown code blocks if present
    if (processedContent.includes('```json')) {
      processedContent = processedContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
    } else if (processedContent.includes('```')) {
      processedContent = processedContent.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    let templates;
    try {
      templates = JSON.parse(processedContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', processedContent);
      // Fallback: create a simple template
      templates = [{
        template_text: rawText,
        placeholders: [],
        description: "Direct template from raw text",
        priority: 5
      }];
    }

    // Save the prompt feed to database
    const { data: feedData, error: feedError } = await supabase
      .from('prompt_feeds')
      .insert({
        category,
        subcategory,
        tags,
        raw_text: rawText,
        processed_templates: templates,
        admin_id: adminId,
        status: 'pending'
      })
      .select()
      .single();

    if (feedError) {
      console.error('Database error:', feedError);
      throw new Error(`Database error: ${feedError.message}`);
    }

    // Save individual templates to type_templates for immediate use
    const templateInserts = templates.map((template: any) => ({
      type_id: typeId,
      template_text: template.template_text,
      placeholders: template.placeholders || {},
      priority: template.priority || 5,
      is_active: true, // Auto-approve for immediate use
      effectiveness_score: 0.0,
      usage_count: 0,
      tags: tags || [],
      metadata: {
        feed_id: feedData.id,
        user_id: adminId,
        model_id: modelId,
        category: category,
        subcategory: subcategory,
        created_by: 'ai_processed',
        description: template.description
      }
    }));

    const { error: templatesError } = await supabase
      .from('type_templates')
      .insert(templateInserts);

    if (templatesError) {
      console.error('Templates insert error:', templatesError);
      throw new Error(`Templates error: ${templatesError.message}`);
    }

    return new Response(JSON.stringify({
      success: true,
      feed_id: feedData.id,
      templates_count: templates.length,
      processed_templates: templates
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in prompt-processor:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});