import QueryQL from '@truepic/queryql';

export default class OcorrenciaQuerier extends QueryQL {
  defineSchema(schema) {
    schema.filter('statusid', '=');
    schema.filter('pessoaagendante', '=');
    schema.filter('codigo', '=');
    schema.filter('numerocontratoid', '=');
    schema.filter('grupoocorrenciaid', '=');
    schema.filter('subgrupoocorrenciaid', '=');
    schema.filter('departamentoid', '=');
    schema.filter('dataocorrencia', '=');
    schema.filter('dataocorrencia', 'between');

    schema.sort('id');
    schema.page();
  }

  defineValidation(schema) {
    return {
      'filter:statusid[=]': schema.number(),
      'filter:codigo[=]': schema.number(),
      'filter:pessoaagendante[=]': schema.number(),
      'filter:numerocontratoid[=]': schema.number(),
      'filter:grupoocorrenciaid[=]': schema.number(),
      'filter:subgrupoocorrenciaid[=]': schema.number(),
      'filter:departamentoid[=]': schema.number(),
      'filter:dataocorrencia[=]': schema.number(),
      'filter:dataocorrencia[between][]': schema.string(),
    };
  }

  get sortDefaults() {
    return {
      id: 'asc',
    };
  }

  get pageDefaults() {
    return {
      number: 1,
      size: 20,
    };
  }
}
