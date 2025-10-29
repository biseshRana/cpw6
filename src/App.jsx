import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [minWeight, setMinWeight] = useState(0);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true);
        const promises = [];
        for (let i = 1; i <= 150; i++) {
          promises.push(
            fetch(`https://pokeapi.co/api/v2/pokemon/${i}`)
              .then(res => res.json())
          );
        }
        
        const results = await Promise.all(promises);
        
        const pokemonData = results.map(p => ({
          id: p.id,
          name: p.name,
          types: p.types.map(t => t.type.name),
          height: p.height,
          weight: p.weight,
          hp: p.stats.find(s => s.stat.name === 'hp').base_stat,
          attack: p.stats.find(s => s.stat.name === 'attack').base_stat,
          defense: p.stats.find(s => s.stat.name === 'defense').base_stat,
          speed: p.stats.find(s => s.stat.name === 'speed').base_stat,
          sprite: p.sprites.front_default
        }));
        
        setPokemon(pokemonData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching Pokemon:', error);
        setLoading(false);
      }
    };

    fetchPokemon();
  }, []);

  const calculateStats = () => {
    if (pokemon.length === 0) return { total: 0, avgAttack: 0, maxHP: 0, speedyCount: 0 };
    
    const total = pokemon.length;
    const avgAttack = Math.round(
      pokemon.reduce((sum, p) => sum + p.attack, 0) / total
    );
    const maxHP = Math.max(...pokemon.map(p => p.hp));
    const speedyCount = pokemon.filter(p => p.speed >= 100).length;
    const avgWeight = Math.round(
      pokemon.reduce((sum, p) => sum + p.weight, 0) / total / 10
    );
    
    return { total, avgAttack, maxHP, speedyCount, avgWeight };
  };

  const stats = calculateStats();
  const allTypes = [...new Set(pokemon.flatMap(p => p.types))].sort();

  const filteredPokemon = pokemon.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || p.types.includes(typeFilter);
    const matchesWeight = p.weight >= minWeight;
    return matchesSearch && matchesType && matchesWeight;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">Loading Pokemon data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <div className="header">
          <h1 className="title">Pokemon Data Dashboard</h1>
          <p className="subtitle"> Website to show you the stats of 150 pokemon!</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Total Pokemon</p>
                <p className="stat-value stat-blue">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Avg Attack</p>
                <p className="stat-value stat-red">{stats.avgAttack}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Max HP</p>
                <p className="stat-value stat-green">{stats.maxHP}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <p className="stat-label">Speedy Pokemon</p>
              <p className="stat-subtitle">Speed ≥ 100</p>
              <p className="stat-value stat-purple">{stats.speedyCount}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <p className="stat-label">Avg Weight</p>
              <p className="stat-value stat-orange">{stats.avgWeight} kg</p>
            </div>
          </div>
        </div>

        <div className="filters-card">
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Search by Name</label>
              <div className="search-wrapper">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search Pokemon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Filter by Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                {allTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Min Weight: {minWeight / 10} kg</label>
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={minWeight}
                onChange={(e) => setMinWeight(Number(e.target.value))}
                className="filter-range"
              />
            </div>
          </div>

          <div className="filter-results">
            Showing {filteredPokemon.length} of {pokemon.length} Pokemon
          </div>
        </div>

        <div className="table-card">
          <div className="table-wrapper">
            <table className="pokemon-table">
              <thead>
                <tr>
                  <th>Pokemon</th>
                  <th>Types</th>
                  <th>HP</th>
                  <th>Attack</th>
                  <th>Defense</th>
                  <th>Speed</th>
                  <th>Weight</th>
                </tr>
              </thead>
              <tbody>
                {filteredPokemon.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="pokemon-cell">
                        <img src={p.sprite} alt={p.name} className="pokemon-sprite" />
                        <div className="pokemon-info">
                          <div className="pokemon-name">{p.name}</div>
                          <div className="pokemon-id">#{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="types-cell">
                        {p.types.map(type => (
                          <span key={type} className="type-badge">
                            {type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{p.hp}</td>
                    <td>{p.attack}</td>
                    <td>{p.defense}</td>
                    <td>{p.speed}</td>
                    <td>{(p.weight / 10).toFixed(1)} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPokemon.length === 0 && (
            <div className="empty-state">
              No Pokemon found matching your filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}