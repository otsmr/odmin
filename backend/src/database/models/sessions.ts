export default (sequelize, DataTypes) => {

    const Session = sequelize.define('Session', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true,
        },
        token: {
            type: DataTypes.STRING(160),
            allowNull: false
        },
		type: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'signin'
        },
        clientip: {
            type: DataTypes.STRING(64)
        },
        city: {
            type: DataTypes.STRING(160)
        },
        plz: {
            type: DataTypes.STRING(160)
        },
        country: {
            type: DataTypes.STRING(160)
        },
        userAgent: {
            type: DataTypes.TEXT
        },
        expiresIn: {
            type: DataTypes.DATE
        }
    },
    {
        tableName: 'sessions',
        timestamps: true,
        underscored: true,
    });

    Session.associate = function (models) {
        Session.belongsTo(models.User);
    };

    return Session;

};