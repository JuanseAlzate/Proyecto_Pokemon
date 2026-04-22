const { Capturado } = require('../baseDatos');

const capturarPokemon = async (req, res) => {
  try {
    console.log(req.body);
    const capturado = await Capturado.create(req.body);
    res
      .status(201)
      .json({ mensaje: 'Pokemon capturado', resultado: capturado });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const listarPokemonesUsuario = async (req, res) => {
  try {
    const { usuarioCedula } = req.params;
    const pokemones = await Capturado.findAll({ where: { usuarioCedula } });
    res
      .status(200)
      .json({ mensaje: 'Lista de Pokémon capturados', resultado: pokemones });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

module.exports = {
  capturarPokemon,
  listarPokemonesUsuario,
};
