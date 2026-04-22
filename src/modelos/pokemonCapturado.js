const definePokemonCapturado = (sequelize, DataTypes) => {
  return sequelize.define(
    'PokemonCapturado',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pokemonId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      usuarioCedula: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'pokemoncapturado',
      timestamps: true,
    },
  );
};

module.exports = definePokemonCapturado;
