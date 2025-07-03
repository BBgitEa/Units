import * as monaco from 'monaco-editor';

/**
 * Уникальный идентификатор для языка IDF-Script.
 */
export const languageId = 'idefscript';


monaco.languages.register({ id: languageId });


monaco.languages.setMonarchTokensProvider(languageId, {
  
  
  keywords: [
    'diagram', 'activities', 'flows', 'activity', 'external',
  ],

  typeKeywords: [
    'input', 'control', 'output', 'mechanism',
  ],

  
  tokenizer: {
    root: [
      
      
      [/^\s*#.*$/, 'comment'],

      
      
      [/"([^"\\]|\\.)*$/, 'string.invalid'], 
      [/"/, 'string', '@string'],

      
      
      [/[a-zA-Z_]\w*/, {
        cases: {
          '@keywords': 'keyword',           
          '@typeKeywords': 'type.identifier', 
          '@default': 'identifier'        
        }
      }],
      
      
      [/->/, 'delimiter.arrow'], 
      [/[:,]/, 'delimiter'],      

      
      
      [/[{}()]/, '@brackets'],

      
      
      { include: '@whitespace' },
    ],
    
    
    string: [
      [/[^"]+/, 'string'],
      [/"/, 'string', '@pop']
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
    ],
  },
});