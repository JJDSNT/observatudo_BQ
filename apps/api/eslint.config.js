// Cube.js injeta `cube`/`view`/`CUBE` como globals, e mais: dentro de
// model/cubes/*.js cada cubo referenciado num join (ex.: `dim_indicadores`
// dentro de fact_indicadores.js) também vira um global injetado em tempo
// de compilação do Cube — não dá pra listar isso de antemão de forma
// genérica. Validação semântica real do model é feita pelo próprio Cube
// (`cubejs-dev-server`), não pelo eslint; aqui só interessa lint básico.
module.exports = [
  {
    files: ["cube.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { module: "readonly" },
    },
  },
  {
    files: ["model/**/*.js"],
    languageOptions: { sourceType: "commonjs" },
    rules: {
      "no-undef": "off",
    },
  },
];
