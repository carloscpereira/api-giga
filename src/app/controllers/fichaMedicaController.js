import { QueryTypes } from 'sequelize';

class FichaMedicaController {
    async show(req, res) {
        const { pessoaId } = req.params;
        const { sequelize } = req;

        const queryFichaMedica = `SELECT distinct
                                    b.id as beneficiarioid,
                                    b.contratoid,
                                    datasolicitacao,
                                    horasolicitacao,
                                    w.nome as credenciado,
                                    p.descricao as procedimento,
                                    s.descricao as status
                                FROM cn_fichamedica f
                                    inner join cn_beneficiario b on b.id = f.beneficiarioid
                                    inner join cn_procedimento p on p.id=f.procedimentoid
                                    inner join statusgrupo s on s.id=statusid
                                    inner join vw_dentista_contrato_aut w on w.id=f.dentistaid
                                where b.pessoabeneficiarioid  = ${pessoaId}`;

        const fichaMedica = await sequelize.query(queryFichaMedica, { type: QueryTypes.SELECT });

        return res.json({ error: null, data: fichaMedica });
    }
}

export default new FichaMedicaController();
