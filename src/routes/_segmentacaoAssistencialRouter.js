import { Router } from 'express';

import SegmentacaoAssistencialController from '../app/controllers/segmentacaoAssistencialController';

import { checkOperator } from '../app/middlewares';

const segmentacaoAssistencialRouter = Router();

segmentacaoAssistencialRouter.get('/:operator/', checkOperator, SegmentacaoAssistencialController.index);
// segmentacaoAssistencialRouter.post('/:operator/', checkOperator, SegmentacaoAssistencialController.create);
segmentacaoAssistencialRouter.get('/:operator/:id', checkOperator, SegmentacaoAssistencialController.show);
// segmentacaoAssistencialRouter.put('/:operator/:id', checkOperator, SegmentacaoAssistencialController.update);
// segmentacaoAssistencialRouter.delete('/:operator/:id', checkOperator, SegmentacaoAssistencialController.destroy);

export default segmentacaoAssistencialRouter;
