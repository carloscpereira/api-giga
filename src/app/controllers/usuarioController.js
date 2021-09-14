import { QueryTypes } from 'sequelize';

class UsuarioController {
    async index(req, res) {
        const { sequelize } = req;

        const query = `SELECT usr_codigo, usr_login, usr_senha, usr_nome, usr_email, pessoaid
        FROM sc_portal_associado.fr_usuario`;

        const usuarios = await sequelize.query(query, { type: QueryTypes.SELECT });

        return res.json({ error: null, data: usuarios });
    }

    async show(req, res) {
        const { id } = req.params;
        const { sequelize } = req;

        const queryUsuario = `SELECT usr_codigo, usr_login, usr_senha, usr_nome, usr_email, pessoaid
        FROM sc_portal_associado.fr_usuario WHERE usr_codigo = ${id}`;

        const usuario = await sequelize.query(queryUsuario, { type: QueryTypes.SELECT });

        return res.json({ error: null, data: usuario });
    }

    async create(req, res) {
        const { sequelize } = req;
        const { usr_login, usr_senha, usr_nome, usr_email } = req.body;

        /** Testa se já existe o usuario */
        const query = `SELECT  usr_codigo, usr_login, usr_senha, usr_nome, usr_email, pessoaid
        FROM sc_portal_associado.fr_usuario WHERE usr_login =${usr_login}`;

        const resQuery = await sequelize.query(query, { type: QueryTypes.SELECT });

        if (!resQuery) {
            return res.json({ error: 400, message: 'Usuário já cadastrado.' });
        }

        /**find pessoaID */
        const queryFindPessoa = `SELECT id FROM sp_dadospessoafisica WHERE cpf = '${usr_login}'`;
        const pessoaID = await sequelize.query(queryFindPessoa, { type: QueryTypes.SELECT });

        const insertUsuario = `INSERT INTO sc_portal_associado.fr_usuario (
          usr_login, usr_senha, usr_nome, usr_email, pessoaid) VALUES (
            '${usr_login}', '${usr_senha}', '${usr_nome}', '${usr_email}', ${pessoaID})
            RETURNING usr_codigo, usr_login, usr_senha, usr_nome, usr_email, pessoaid`;

        const newUsuario = await sequelize.query(insertUsuario);

        const queryCriptSenha = `UPDATE sc_portal_associado.fr_usuario
        SET usr_senha = 'md5(${newUsuario.usr_codigo}||${newUsuario.usr_senha})'
        WHERE usr_codigo = ${newUsuario.usr_codigo}
        RETURNING usr_codigo, usr_login, usr_senha, usr_nome, usr_email, pessoaid`;

        const resultUsuario = await sequelize.query(queryCriptSenha);

        return res.json({ error: null, data: resultUsuario });
    }

    async update(req, res) {
        const {
            body: { usuario: paramsUsuario },
            params: { id },
        } = req;

        const usuario = '';

        return res.json({ error: null, data: usuario });
    }

    async destroy(req, res) {
        const {
            params: { id },
        } = req;

        const usuario = '';

        return res.json({ error: null });
    }
}

export default new UsuarioController();
