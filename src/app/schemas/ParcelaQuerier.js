import QueryQL from '@truepic/queryql';

export default class ParcelaQuerier extends QueryQL {
  defineSchema(schema) {
    schema.filter('tituloid', '=');
    schema.filter('datavencimento', '=');
    schema.filter('datavencimento', 'between');
    schema.filter('datacadastramento', 'between');
    schema.filter('statusgrupoid', '=');
    schema.filter('statusgrupoid', 'in');

    schema.sort('id');
    schema.page();
  }

  defineValidation(schema) {
    return {
      'filter:tituloid[=]': schema.number(),
      'filter:datavencimento[between]': schema.string(),
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
