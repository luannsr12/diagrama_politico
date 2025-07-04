import { useRef, useState, useEffect } from 'react';
import type { DragEvent, MouseEvent } from 'react';
import './App.css';

interface Logo {
  name: string;
  url: string;
}

interface Item {
  id: string;
  name: string;
  url: string;
  x: number;
  y: number;
  selected: boolean;
}

const logos: Logo[] = [
  {
    name: 'MDB',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/MDB_Logo.png/120px-MDB_Logo.png',
  },
  {
    name: 'PT',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/PT_%28Brazil%29_logo_2021.svg/60px-PT_%28Brazil%29_logo_2021.svg.png',
  },
  {
    name: 'PP',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Progressistas_logo.png/120px-Progressistas_logo.png',
  },
  {
    name: 'PRD',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Logomarca_Partido_Renova%C3%A7%C3%A3o_Democr%C3%A1tica.png/120px-Logomarca_Partido_Renova%C3%A7%C3%A3o_Democr%C3%A1tica.png',
  },
];

const gridSize = 50;
const width = 700;
const height = 700;
const imgSize = 50;

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [sidebarLogos, setSidebarLogos] = useState<Logo[]>(logos);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingLogo, setDraggingLogo] = useState<Logo | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setItems(prev => prev.map(item => ({ ...item, selected: false })));
      }
    };

    // @ts-ignore
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // @ts-ignore
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const name = e.dataTransfer.getData('logo');
    const logo = logos.find((l) => l.name === name);
    if (!logo || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left - imgSize / 2;
    let y = e.clientY - rect.top - imgSize / 2;

    x = Math.max(0, Math.min(x, width - imgSize));
    y = Math.max(0, Math.min(y, height - imgSize));

    setItems((prev) => [
      ...prev.map(item => ({ ...item, selected: false })),
      {
        id: `${name}-${Date.now()}`,
        name,
        url: logo.url,
        x,
        y,
        selected: true,
      },
    ]);

    setSidebarLogos((prev) => prev.filter((l) => l.name !== name));
    setDraggingLogo(null);
    setDragOverIndex(null);
  };

  const handleRemove = (id: string, name: string, url: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSidebarLogos((prev) => [...prev, { name, url }]);
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, id: string) => {
    setDraggingItemId(id);
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, selected: true } : { ...item, selected: false }
    ));
    e.dataTransfer.setData('itemId', id);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>, id: string) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    let x = e.clientX - rect.left - imgSize / 2;
    let y = e.clientY - rect.top - imgSize / 2;

    x = Math.max(0, Math.min(x, width - imgSize));
    y = Math.max(0, Math.min(y, height - imgSize));

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, x, y } : i))
    );
  };

  const handleDragEnd = (id: string) => {
    setDraggingItemId(null);
  };

  const handleItemClick = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, selected: true } : { ...item, selected: false }
    ));
  };

  const handleReorderSidebar = (fromIndex: number, toIndex: number) => {
    const updated = [...sidebarLogos];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setSidebarLogos(updated);
  };

  return (
    <>
    <div>
      <h2>Diagrama de Politico</h2>
    </div>
    <div style={{ display: 'flex', position: 'relative', padding: '50px 0' }}>
        {/* Container principal com o plano cartesiano */}
        <div style={{ position: 'relative' }}>

          <div
            ref={containerRef}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => setItems(prev => prev.map(item => ({ ...item, selected: false })))}
            style={{
              width,
              height,
              position: 'relative',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
            }}
          >

            {/* Títulos dos eixos */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: -170,
              fontWeight: 300,
              fontSize: '1.2rem',
              color: '#fff',
              transform: 'translateY(-50%) rotate(-90deg)',
              width: 300,
              textAlign: 'center',
              textTransform: 'uppercase'
            }}>Controle Econômico</div>

            <div style={{
              position: 'absolute',
              top: '50%',
              right: -170,
              fontWeight: 300,
              fontSize: '1.2rem',
              color: '#fff',
              transform: 'translateY(-50%) rotate(90deg)',
              width: 300,
              textAlign: 'center',
              textTransform: 'uppercase'
            }}>Liberdade Econômica</div>

            <div style={{
              position: 'absolute',
              top: -40,
              left: '50%',
              fontWeight: 300,
              fontSize: '1.2rem',
              color: '#fff',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              textTransform: 'uppercase'
            }}>Autoritarismo</div>

            <div style={{
              position: 'absolute',
              bottom: -40,
              left: '50%',
              fontWeight: 300,
              fontSize: '1.2rem',
              color: '#fff',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              textTransform: 'uppercase'
            }}>Libertarianismo</div>

            <div style={{
              position: 'absolute',
              top: '50%',
              left: -40,
              fontWeight: 'bold',
              fontSize: '1rem',
              color: '#000',
              zIndex: 1,
              opacity: 0.2,
              transform: 'translateY(-50%) rotate(-90deg)',
            }}>
              <span style={{ fontSize: '40px' }}>Esquerda</span>
            </div>

            <div style={{
              position: 'absolute',
              top: '50%',
              right: -20,
              fontWeight: 'bold',
              fontSize: '1rem',
              color: '#000',
              zIndex: 1,
              opacity: 0.2,
              transform: 'translateY(-50%) rotate(90deg)'
            }}>
              <span style={{ fontSize: '40px' }}>Direita</span>
            </div>

            {/* Rótulos dos quadrantes nos cantos */}
            <div style={{
              position: 'absolute',
              top: 20,
              left: 20,
              fontWeight: 'bold',
              fontSize: '1.1rem',
              color: '#000',
              backgroundColor: 'rgba(255,255,255,0.7)',
              padding: '5px 10px',
              borderRadius: 5,
              border: '1px solid #ccc',
              zIndex: 1
            }}>Totalitarismo</div>

            <div style={{
              position: 'absolute',
              top: 20,
              right: 20,
              fontWeight: 'bold',
              fontSize: '1.1rem',
              color: '#000',
              backgroundColor: 'rgba(255,255,255,0.7)',
              padding: '5px 10px',
              borderRadius: 5,
              border: '1px solid #ccc',
              zIndex: 1
            }}>Conservadorismo</div>

            <div style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              fontWeight: 'bold',
              fontSize: '1.1rem',
              color: '#000',
              backgroundColor: 'rgba(255,255,255,0.7)',
              padding: '5px 10px',
              borderRadius: 5,
              border: '1px solid #ccc',
              zIndex: 1
            }}>Progressismo</div>

            <div style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              fontWeight: 'bold',
              fontSize: '1.1rem',
              color: '#000',
              backgroundColor: 'rgba(255,255,255,0.7)',
              padding: '5px 10px',
              borderRadius: 5,
              border: '1px solid #ccc',
              zIndex: 1
            }}>Liberalismo</div>

            {/* Quadrantes coloridos com transparência */}
            <div style={{ position: 'absolute', width: width / 2, height: height / 2, backgroundColor: '#f88', top: 0, left: 0, zIndex: 0 }} />
            <div style={{ position: 'absolute', width: width / 2, height: height / 2, backgroundColor: '#8cf', top: 0, left: width / 2, zIndex: 0 }} />
            <div style={{ position: 'absolute', width: width / 2, height: height / 2, backgroundColor: '#8f8', top: height / 2, left: 0, zIndex: 0 }} />
            <div style={{ position: 'absolute', width: width / 2, height: height / 2, backgroundColor: '#d8f', top: height / 2, left: width / 2, zIndex: 0 }} />

            {/* Linhas divisórias principais (cruz) */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              width: 2,
              height: '100%',
              backgroundColor: '#000',
              transform: 'translateX(-1px)',
              zIndex: 0
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: '100%',
              height: 2,
              backgroundColor: '#000',
              transform: 'translateY(-1px)',
              zIndex: 0
            }} />

            {/* Grade visual mais sutil */}
            {Array.from({ length: width / gridSize }).map((_, i) => (
              <div key={`v-${i}`} style={{
                position: 'absolute',
                top: 0,
                left: i * gridSize,
                width: 1,
                height: height,
                backgroundColor: 'rgba(102, 102, 102, 0.37)',
                zIndex: 0
              }} />
            ))}
            {Array.from({ length: height / gridSize }).map((_, i) => (
              <div key={`h-${i}`} style={{
                position: 'absolute',
                top: i * gridSize,
                left: 0,
                width: width,
                height: 1,
                backgroundColor: 'rgba(102, 102, 102, 0.37)',
                zIndex: 0
              }} />
            ))}

            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  top: `${item.y}px`,
                  left: `${item.x}px`,
                  width: `${imgSize}px`,
                  height: `${imgSize}px`,
                  cursor: 'move',
                  userSelect: 'none',
                  zIndex: 2,
                  opacity: draggingItemId === item.id ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                  padding: 10,
                  outline: item.selected ? '2px dashed rgb(0, 0, 0)' : 'none'
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDrag={(e) => handleDrag(e, item.id)}
                onDragEnd={() => handleDragEnd(item.id)}
                onClick={(e) => handleItemClick(e, item.id)}
              >
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <img
                    src={item.url}
                    alt={item.name}
                    width={imgSize}
                    height={imgSize}
                    style={{
                      pointerEvents: 'none',
                      filter: draggingItemId === item.id ? 'brightness(0.8)' : 'none'
                    }} />
                  {item.selected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.id, item.name, item.url);
                      } }
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        background: '#ff4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 'bold',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        padding: 0,
                        zIndex: 3
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width: 200, marginLeft: 100 }}>
          {sidebarLogos.map((logo, index) => (
            <div
              key={logo.name}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('logo', logo.name);
                e.dataTransfer.setData('fromIndex', index.toString());
                setDraggingLogo(logo);
              } }
              onDrop={(e) => {
                e.preventDefault();
                const from = parseInt(e.dataTransfer.getData('fromIndex'));
                handleReorderSidebar(from, index);
                setDragOverIndex(null);
              } }
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverIndex(index);
              } }
              onDragLeave={() => setDragOverIndex(null)}
              style={{
                textAlign: 'center',
                marginBottom: 10,
                padding: 10,
                border: dragOverIndex === index ? '2px dashed #007bff' : '1px dashed #ccc',
                borderRadius: 4,
                cursor: 'grab',
                width: 100,
                minHeight: 70,
                backgroundColor: dragOverIndex === index ? '#eef6ff' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}
            >
              {dragOverIndex === index && draggingLogo ? (
                <>
                  <div style={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                    <img src={draggingLogo.url} alt={draggingLogo.name} width={50} height={50} />
                  </div>
                  <div style={{ height: 4 }}></div>
                </>
              ) : (
                <>
                  <img src={logo.url} alt={logo.name} width={50} height={50} />
                  <div>{logo.name}</div>
                </>
              )}
            </div>
          ))}
        </div>
      </div></>
  );
}