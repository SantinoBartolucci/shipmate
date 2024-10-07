const helper = {};

helper.IsSqlInjectionAttempt = (input) => {
    const sqlInjectionPatterns = [
        /['";]/,                      // Comillas simples, dobles y punto y coma
        /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|WHERE|AND|OR|JOIN|--|#|\/\*|\*\/)\b/i // Palabras clave SQL
    ];
    
    return sqlInjectionPatterns.some(pattern => pattern.test(input));
};

module.exports = helper;