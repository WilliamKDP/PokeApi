import React, { useState, useEffect } from "react";
import "./App.css";
import logo from "./pokeapi.png"; // 

const App = () => {
  const [search, setSearch] = useState(""); // Término de búsqueda
  const [debouncedSearch, setDebouncedSearch] = useState(""); // Término con debounce
  const [allPokemon, setAllPokemon] = useState([]); // Lista completa de Pokémon
  const [filteredResults, setFilteredResults] = useState([]); // Resultados filtrados dinámicamente
  const [loading, setLoading] = useState(false); // Estado de carga
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const itemsPerPage = 6; // Pokémon por página

  // Traducción de generaciones
  const generationTranslations = {
    "generation-i": "Primera Generación",
    "generation-ii": "Segunda Generación",
    "generation-iii": "Tercera Generación",
    "generation-iv": "Cuarta Generación",
    "generation-v": "Quinta Generación",
    "generation-vi": "Sexta Generación",
    "generation-vii": "Séptima Generación",
    "generation-viii": "Octava Generación",
  };

  // Traducción de tipos
  const typeTranslations = {
    normal: "Normal",
    fire: "Fuego",
    water: "Agua",
    electric: "Eléctrico",
    grass: "Planta",
    ice: "Hielo",
    fighting: "Lucha",
    poison: "Veneno",
    ground: "Tierra",
    flying: "Volador",
    psychic: "Psíquico",
    bug: "Bicho",
    rock: "Roca",
    ghost: "Fantasma",
    dragon: "Dragón",
    dark: "Siniestro",
    steel: "Acero",
    fairy: "Hada",
  };

  // Aplicar debounce al término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms de retardo
    return () => clearTimeout(timer); // Limpiar temporizador anterior
  }, [search]);

  // Cargar lista completa de Pokémon al inicio
  useEffect(() => {
    const fetchAllPokemon = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10000");
        const data = await response.json();
        setAllPokemon(data.results); // Guardar lista completa de Pokémon
      } catch (error) {
        console.error("Error al cargar la lista de Pokémon:", error);
        setAllPokemon([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPokemon();
  }, []);

  // Filtrar resultados dinámicamente y obtener detalles adicionales
  useEffect(() => {
    const fetchDetails = async () => {
      if (debouncedSearch.trim() !== "") {
        const filtered = allPokemon.filter((pokemon) =>
          pokemon.name.toLowerCase().startsWith(debouncedSearch.toLowerCase())
        );

        const detailedResults = await Promise.all(
          filtered.map(async (pokemon) => {
            const response = await fetch(pokemon.url);
            const data = await response.json();

            const speciesResponse = await fetch(data.species.url);
            const speciesData = await speciesResponse.json();

            return {
              id: data.id,
              name: data.name,
              sprite: data.sprites.front_default,
              height: data.height / 10 + " m", // Convertir altura a metros
              weight: data.weight / 10 + " kg", // Convertir peso a kilogramos
              types: data.types.map((type) => typeTranslations[type.type.name] || type.type.name),
              generation: generationTranslations[speciesData.generation.name] || "Generación desconocida",
            };
          })
        );

        setFilteredResults(detailedResults);
      } else {
        setFilteredResults([]); // Vaciar resultados si no hay búsqueda
      }
    };

    fetchDetails();
  }, [debouncedSearch, allPokemon]);

  // Manejar cambios en el buscador
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reiniciar paginación
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPageResults = filteredResults.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredResults.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="app">
      {/* Barra de navegación */}
      <nav className="navbar">
        <img src={logo} alt="Logo PokeApi" className="logo" />
        <h1>William Eduardo Ku Pool</h1>
      </nav>

      {/* Buscador */}
      <div className="container">
        <div className="search">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Escribe el nombre del Pokémon..."
              value={search}
              onChange={handleSearchChange}
            />
            <button>🔍</button>
          </div>
        </div>

        {/* Tabla */}
        <div className="content">
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Imagen</th>
                  <th>Altura</th>
                  <th>Peso</th>
                  <th>Tipos</th>
                  <th>Generación</th>
                </tr>
              </thead>
              <tbody>
                {currentPageResults.length > 0 ? (
                  currentPageResults.map((pokemon) => (
                    <tr key={pokemon.id}>
                      <td>{pokemon.id}</td>
                      <td>{pokemon.name}</td>
                      <td>
                        <img src={pokemon.sprite} alt={pokemon.name} />
                      </td>
                      <td>{pokemon.height}</td>
                      <td>{pokemon.weight}</td>
                      <td>{pokemon.types.join(", ")}</td>
                      <td>{pokemon.generation}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-results">No se encontraron resultados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* Barra de paginación */}
          <div className="pagination">
            <button onClick={handlePrevPage} disabled={currentPage === 1}>
              Anterior
            </button>
            <span>Página {currentPage}</span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= Math.ceil(filteredResults.length / itemsPerPage)}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;