
interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
}

interface Experience {
  title?: string;
  company?: string;
  duration?: string;
  description?: string;
}

interface Education {
  degree?: string;
  institution?: string;
  year?: string;
  details?: string;
}

interface EnhancedCVData {
  personalInfo?: PersonalInfo;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  improvements?: string[];
  rawContent?: string;
}

export const generateCVTemplate = (data: EnhancedCVData): string => {
  const {
    personalInfo = {},
    experience = [],
    education = [],
    skills = [],
    improvements = []
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${personalInfo.name || 'Enhanced CV'}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            color: #2563eb;
            font-size: 2.5em;
        }
        .contact-info {
            margin: 10px 0;
            color: #666;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #2563eb;
            border-bottom: 1px solid #2563eb;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .summary {
            background: #f8fafc;
            padding: 15px;
            border-left: 4px solid #2563eb;
            margin-bottom: 20px;
        }
        .experience-item, .education-item {
            margin-bottom: 20px;
            border-left: 3px solid #e5e7eb;
            padding-left: 15px;
        }
        .experience-item h3, .education-item h3 {
            margin: 0 0 5px 0;
            color: #374151;
        }
        .company, .institution {
            font-weight: bold;
            color: #2563eb;
        }
        .duration {
            color: #6b7280;
            font-style: italic;
        }
        .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .skill {
            background: #2563eb;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.9em;
        }
        .improvements {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
        }
        .improvements h3 {
            color: #0ea5e9;
            margin-top: 0;
        }
        .improvements ul {
            margin: 0;
            padding-left: 20px;
        }
        .improvements li {
            margin-bottom: 5px;
        }
        @media print {
            body { padding: 0; }
            .improvements { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${personalInfo.name || 'Professional CV'}</h1>
        ${personalInfo.email ? `<div class="contact-info">Email: ${personalInfo.email}</div>` : ''}
        ${personalInfo.phone ? `<div class="contact-info">Phone: ${personalInfo.phone}</div>` : ''}
        ${personalInfo.location ? `<div class="contact-info">Location: ${personalInfo.location}</div>` : ''}
    </div>

    ${personalInfo.summary ? `
    <div class="section">
        <h2>Professional Summary</h2>
        <div class="summary">
            ${personalInfo.summary}
        </div>
    </div>
    ` : ''}

    ${experience.length > 0 ? `
    <div class="section">
        <h2>Professional Experience</h2>
        ${experience.map(exp => `
            <div class="experience-item">
                <h3>${exp.title || 'Position'}</h3>
                <div class="company">${exp.company || 'Company'}</div>
                <div class="duration">${exp.duration || 'Duration'}</div>
                <p>${exp.description || 'Job description and achievements'}</p>
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${education.length > 0 ? `
    <div class="section">
        <h2>Education</h2>
        ${education.map(edu => `
            <div class="education-item">
                <h3>${edu.degree || 'Degree'}</h3>
                <div class="institution">${edu.institution || 'Institution'}</div>
                <div class="duration">${edu.year || 'Year'}</div>
                ${edu.details ? `<p>${edu.details}</p>` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${skills.length > 0 ? `
    <div class="section">
        <h2>Skills</h2>
        <div class="skills">
            ${skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
        </div>
    </div>
    ` : ''}

    ${improvements.length > 0 ? `
    <div class="improvements">
        <h3>AI Enhancements Made</h3>
        <ul>
            ${improvements.map(improvement => `<li>${improvement}</li>`).join('')}
        </ul>
    </div>
    ` : ''}
</body>
</html>
  `.trim();
};

export const downloadCVAsHTML = (htmlContent: string, filename: string = 'Enhanced_CV.html') => {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
