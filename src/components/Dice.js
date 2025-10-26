import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { useSpring, animated } from '@react-spring/three';
import './Dice.css';


function getDiceRotation(value) {
    // Rotations donner par Mr
    const rotations = {
        1: [-Math.PI / 2, 0, 0],             
        2: [0, -Math.PI / 2, 0],             
        3: [0, Math.PI, 0],                  
        4: [0, Math.PI / 2, 0],              
        5: [Math.PI / 2, 0, 0],              
        6: [0, 0, 0],                        
    };
    return rotations[value] || [0, 0, 0];
}

// Composant 3D 
function Dice3D({ value }) {
    const meshRef = useRef();
    
    const textures = useLoader(TextureLoader, [
        '/faces-dice/dice1.png',
        '/faces-dice/dice2.png',
        '/faces-dice/dice3.png',
        '/faces-dice/dice4.png',
        '/faces-dice/dice5.png',
        '/faces-dice/dice6.png'
    ]);

    // Rotation
    const [rotX, rotY, rotZ] = getDiceRotation(value);

    // Animation rota
    const { rotation } = useSpring({
        rotation: [rotX + 0.2, rotY + 0.3, rotZ + 0.1],
        config: {
            tension: 120,
            friction: 25,
            duration: 800
        }
    });

    return (
        <animated.mesh ref={meshRef} rotation={rotation}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial map={textures[1]} attach="material-0" /> 
            <meshStandardMaterial map={textures[3]} attach="material-1" /> 
            <meshStandardMaterial map={textures[4]} attach="material-2" /> 
            <meshStandardMaterial map={textures[0]} attach="material-3" /> 
            <meshStandardMaterial map={textures[5]} attach="material-4" /> 
            <meshStandardMaterial map={textures[2]} attach="material-5" /> 
        </animated.mesh>
    );
}

function Dice() {
    const [dice, setDice] = useState(1);
    const [history, setHistory] = useState([]);
    const [isRolling, setIsRolling] = useState(false);
    
    const rollDice = () => {
        if (isRolling) return; // Empêche les clics multiples pendant l'animation
        
        setIsRolling(true);
        
        // Animation de "lancer" avec plusieurs rotations aléatoires
        const rollSteps = 5;
        let step = 0;
        
        const rollAnimation = setInterval(() => {
            if (step < rollSteps - 1) {
                // Rotations aléatoires pendant l'animation
                setDice(Math.floor(Math.random() * 6) + 1);
            } else {
                // Dernière rotation : la vraie valeur
                const finalValue = Math.floor(Math.random() * 6) + 1;
                setDice(finalValue);
                setHistory(prev => [...prev, finalValue]);
                setIsRolling(false);
                clearInterval(rollAnimation);
            }
            step++;
        }, 100);
    }

    useEffect(() => {
        const savedHistory = localStorage.getItem('diceHistory');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    useEffect(() => {
        if (history.length > 0) {
            localStorage.setItem('diceHistory', JSON.stringify(history));
        }
    }, [history]);

    return (
        <div className="dice-container">
            <h1>Balance ton dé !</h1>
            <div className="dice-3d-container" style={{ width: '300px', height: '300px', margin: '20px auto' }}>
                <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[5, 5, 5]} intensity={1} />
                    <pointLight position={[10, 10, 10]} intensity={0.5} />
                    <Dice3D value={dice} />
                </Canvas>
            </div>
            <button onClick={rollDice} disabled={isRolling}>
                {/* Pour améliorer le design */}
                {isRolling ? '🎲 Lancement...' : 'Lancer'}
            </button>
            <h3>Historique des lancers</h3>
            <div className="history">
                {history.map((value, index) => (
                    <span key={index}>{value} </span>
                ))}
            </div>
        </div>
    );
}

export default Dice;