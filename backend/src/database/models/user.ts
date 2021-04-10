export default (sequelize, DataTypes) => {

    const User = sequelize.define('User', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
		role: {
            type: DataTypes.ENUM,
            values: ['admin', 'editor', 'viewer'],
            allowNull: false,
            defaultValue: 'viewer'
        },
        password: {
            type: DataTypes.STRING(128),
        },
		salt: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        twofa: {
            type: DataTypes.STRING(40)
        },
        saveLog: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
    }, 
    {
        tableName: 'users',
        timestamps: true,
        underscored: true,
    });

    User.associate = function (models) {

        User.hasMany(models.Session, { foreignKey: 'user_id', onDelete: "CASCADE" });
        User.hasMany(models.Notifications);
        User.hasMany(models.Service, { foreignKey: 'user_id', onDelete: "CASCADE"  });
        User.hasMany(models.Webauthn, { foreignKey: 'user_id', onDelete: "CASCADE"  });

    };
    
    return User;

};
