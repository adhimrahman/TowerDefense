import { useState, useEffect } from "react";

const GameGrid = () => {
    const rows = 9;
    const cols = 16;
    const path = [
        { row: 1, col: 0 },{ row: 1, col: 1 },{ row: 2, col: 1 },{ row: 3, col: 1 },{ row: 4, col: 1 },{ row: 5, col: 1 },
        { row: 6, col: 1 },{ row: 7, col: 1 },{ row: 7, col: 2 },{ row: 7, col: 3 },{ row: 7, col: 4 },{ row: 6, col: 4 },
        { row: 5, col: 4 },{ row: 4, col: 4 },{ row: 3, col: 4 },{ row: 2, col: 4 },{ row: 1, col: 4 },{ row: 1, col: 5 },
        { row: 1, col: 6 },{ row: 1, col: 7 },{ row: 2, col: 7 },{ row: 3, col: 7 },{ row: 4, col: 7 },{ row: 5, col: 7 },
        { row: 6, col: 7 },{ row: 7, col: 7 },{ row: 7, col: 8 },{ row: 7, col: 9 },{ row: 7, col: 10 },{ row: 6, col: 10 },
        { row: 5, col: 10 },{ row: 4, col: 10 },{ row: 3, col: 10 },{ row: 2, col: 10 },{ row: 1, col: 10 },
        { row: 1, col: 11 },{ row: 1, col: 12 },{ row: 1, col: 13 },{ row: 2, col: 13 },{ row: 3, col: 13 },
        { row: 4, col: 13 },{ row: 5, col: 13 },{ row: 6, col: 13 },{ row: 7, col: 13 },{ row: 7, col: 14 },
        { row: 7, col: 15 },
    ];

    const [enemies, setEnemies] = useState([
        { id: 1, pathIndex: 0, hp: 100, speed: 1000, img: "/images/enemy1.png" },
        { id: 2, pathIndex: 0, hp: 150, speed: 1000, img: "/images/enemy2.png" },
    ]);

    const [towers, setTowers] = useState([
        { id: 1, row: 5, col: 5, damage: 100, range: 3, img: "/images/tower.png" },
    ]);

    const [projectiles, setProjectiles] = useState([]);

    useEffect(() => {
        const intervals = enemies.map((enemy, index) => {
            return setInterval(() => {
                setEnemies((prev) => {
                    const updated = [...prev];
                    const currentEnemy = updated[index];
                    if (currentEnemy.pathIndex + 1 < path.length) {
                        currentEnemy.pathIndex += 1;
                    }
                    return updated;
                });
            }, enemy.speed);
        });
    
        return () => intervals.forEach((interval) => clearInterval(interval));
    }, [enemies]);

    useEffect(() => {
        const attackInterval = setInterval(() => {
            towers.forEach((tower) => {
                const target = enemies.find((enemy) => {
                    const enemyRow = path[enemy.pathIndex]?.row;
                    const enemyCol = path[enemy.pathIndex]?.col;
                    const distance = Math.sqrt(
                        Math.pow(tower.row - enemyRow, 2) + Math.pow(tower.col - enemyCol, 2)
                    );
                    return distance <= tower.range && enemy.hp > 0;
                });
        
                if (target) {   // Launch projectile
                    setProjectiles((prev) => [...prev,{ towerId: tower.id, targetId: target.id, x: tower.col, y: tower.row },]);
                    setEnemies((prevEnemies) =>     // Apply damage
                        prevEnemies.map((enemy) =>
                            enemy.id === target.id ? { ...enemy, hp: Math.max(enemy.hp - tower.damage, 0) } : enemy
                        )
                    );
                }
            });
        }, 1000);
    
        return () => clearInterval(attackInterval);
    }, [towers, enemies]);

    useEffect(() => {
        const projectileInterval = setInterval(() => {
          setProjectiles((prevProjectiles) =>
            prevProjectiles
              .map((projectile) => {
                const target = enemies.find((enemy) => enemy.id === projectile.targetId);
                if (!target || target.hp <= 0) return null; // Remove projectile if the target is destroyed
      
                const targetRow = path[target.pathIndex]?.row;
                const targetCol = path[target.pathIndex]?.col;
      
                const deltaX = targetCol - projectile.x;
                const deltaY = targetRow - projectile.y;
      
                if (Math.abs(deltaX) < 0.1 && Math.abs(deltaY) < 0.1) {
                  // Projectile hits the target
                  return null;
                }
      
                // Move projectile towards the target
                return {
                  ...projectile,
                  x: projectile.x + deltaX * 0.1,
                  y: projectile.y + deltaY * 0.1,
                };
              })
              .filter((projectile) => projectile !== null) // Remove projectiles that hit their target
          );
        }, 50);
      
        return () => clearInterval(projectileInterval);
    }, [enemies, path]);      
  
    const grid = [];
    for (let row = 0; row < rows; row++) {
		const rowItems = [];
		for (let col = 0; col < cols; col++) {
			const isPath = path.some((p) => p.row === row && p.col === col);
			// const isEnemy = enemyIndex < path.length && path[enemyIndex].row === row && path[enemyIndex].col === col;
            const enemyHere = enemies.find(
                (enemy) =>
                  path[enemy.pathIndex].row === row && path[enemy.pathIndex].col === col
              );
            const towerHere = towers.find((tower) => tower.row === row && tower.col === col);
			
			rowItems.push(
				<div key={`${row}-${col}`} className={`border ${
                    isPath ? "bg-brown-500" : "bg-green-500"} relative`}
					style={{ flex: `1 0 calc(100% / ${cols})`, height: `calc(100vh / ${rows})` }}
                    onClick={() => { if (!isPath && !towerHere) {
                        setTowers((prev) => [ ...prev, { id: Date.now(), row, col, damage: 20, range: 3, img: "/images/tower.png" } ]);
                    }}}>
                    {enemyHere && (
                        <img src={enemyHere.img} alt="enemy" className="absolute w-full h-full object-cover" />
                    )}
                    {towerHere && (
                        <>
                            <img src={towerHere.img} alt="tower" className="absolute w-full h-full object-cover" />
                            <div className="absolute border border-blue-500 rounded-full" style={{
                                width: `${towers.range * 2 * 25}px`,
                                height: `${towers.range * 2 * 25}px`,
                                top: `-${towers.range * 25}px`,
                                left: `-${towers.range * 25}px`,
                            }}></div>
                        </>
                    )}
                </div>
			);
		}
		grid.push( <div key={row} className="flex"> {rowItems} </div> );
    }
  
    // return <div className="flex flex-col w-screen h-screen">{grid}</div>;
    return (
        <div className="relative w-screen h-screen">
            {grid}
            {projectiles.map((projectile, index) => (
                <div key={index} className="absolute bg-red-500 rounded-full" style={{
                    width: "10px",
                    height: "10px",
                    top: `${projectile.y * (100 / rows)}%`,
                    left: `${projectile.x * (100 / cols)}%`,
                    transform: "translate(-50%, -50%)",
                }}
                ></div>
            ))}
        </div>
    )
};
  
export default GameGrid;