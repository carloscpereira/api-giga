import { Router } from 'express';

import EstadoCivil from '../app/controllers/estadoCivilController';

import { checkOperator } from '../app/middlewares';

const estadoCivilRouter = new Router();

estadoCivilRouter.get('/:operator/', checkOperator, EstadoCivil.index);
// estadoCivilRouter.post('/:operator/', checkOperator, EstadoCivil.create);
estadoCivilRouter.get('/:operator/:id', checkOperator, EstadoCivil.show);
// estadoCivilRouter.put('/:operator/:id', checkOperator, EstadoCivil.update);
// estadoCivilRouter.delete('/:operator/:id', checkOperator, EstadoCivil.destroy);

export default estadoCivilRouter;
