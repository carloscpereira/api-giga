import QueryQL from '@truepic/queryql';

export default class LoteQuerier extends QueryQL {
  defineSchema(schema) {
    schema.filter('datacadastro', '=');
    schema.filter('datacadastro', 'between');
    schema.filter('datacadastramento', 'between');
    schema.filter('statusgrupoid', '=');
    schema.filter('statusgrupoid', 'in');

    schema.sort('id');
    schema.page();
  }

  defineValidation(schema) {
    return {
      'filter:datacadastro[=]': schema.number(),
      'filter:statusgrupoid[=]': schema.number(),
      'filter:statusgrupoid[in]': schema.number(),
      'filter:datavencimento[between][]': schema.string(),
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
