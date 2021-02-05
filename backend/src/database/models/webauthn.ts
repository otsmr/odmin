export default (sequelize, DataTypes) => {

    const Webauthn = sequelize.define('Webauthn', {
        credentialID: {
            type: DataTypes.STRING(64),
            allowNull: false,
            primaryKey: true
        },
		name: {
            type: DataTypes.STRING(60),
            allowNull: false
        },
		signCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
		publicKeyJwk: {
            type: DataTypes.JSON,
            allowNull: false
        }
    },
    {
        tableName: 'webauthn',
        timestamps: true,
        underscored: true,
    });

    Webauthn.associate = function (models) {
        Webauthn.belongsTo(models.User);
    };

    return Webauthn;

}