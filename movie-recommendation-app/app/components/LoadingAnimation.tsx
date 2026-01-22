'use client';

export default function LoadingAnimation() {
  return (
    <>
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative w-80 h-80" style={{ perspective: '1000px' }}>
          {/* TV Set - Static */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10">
            {/* TV Stand */}
            <div className="w-40 h-5 bg-gray-700 rounded-sm mx-auto mb-0 shadow-lg"></div>
            
            {/* TV Screen */}
            <div className="relative w-48 h-36 bg-black rounded-lg mx-auto shadow-2xl">
              {/* TV Frame */}
              <div className="absolute inset-0 border-4 border-gray-800 rounded-lg"></div>
              
              {/* Screen Content - Animated */}
              <div className="absolute inset-2 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 rounded overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 border-4 border-imdb-yellow border-t-transparent rounded-full animate-spin"></div>
                </div>
                {/* Scan lines effect */}
                <div 
                  className="absolute inset-0 opacity-20" 
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
                  }}
                ></div>
              </div>
              
              {/* TV Controls */}
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Revolving 3D Armchair */}
          <div 
            className="absolute bottom-12 left-1/2"
            style={{
              transform: 'translateX(-50%)',
              transformStyle: 'preserve-3d',
              animation: 'revolveChair 4s linear infinite',
              animationName: 'revolveChair'
            }}
          >
            <div 
              className="relative"
              style={{
                width: '120px',
                height: '100px',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Chair Back */}
              <div 
                className="absolute top-0 left-1/2"
                style={{
                  width: '80px',
                  height: '80px',
                  marginLeft: '-40px',
                  background: 'linear-gradient(to bottom, #92400e, #78350f)',
                  borderRadius: '8px 8px 0 0',
                  transform: 'translateZ(15px)',
                  boxShadow: 'inset 0 0 15px rgba(0,0,0,0.4), 0 5px 15px rgba(0,0,0,0.3)'
                }}
              >
                <div className="absolute inset-2 border-2 border-amber-700 rounded opacity-60"></div>
              </div>
              
              {/* Chair Seat */}
              <div 
                className="absolute bottom-0 left-1/2"
                style={{
                  width: '100px',
                  height: '30px',
                  marginLeft: '-50px',
                  background: 'linear-gradient(to bottom, #b45309, #92400e)',
                  borderRadius: '4px',
                  transform: 'translateZ(8px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.5)'
                }}
              ></div>
              
              {/* Left Armrest */}
              <div 
                className="absolute left-0 top-5"
                style={{
                  width: '8px',
                  height: '50px',
                  background: 'linear-gradient(to right, #92400e, #78350f)',
                  borderRadius: '4px 0 0 4px',
                  transform: 'rotateY(-90deg) translateZ(15px)',
                  boxShadow: '2px 0 5px rgba(0,0,0,0.3)'
                }}
              ></div>
              
              {/* Right Armrest */}
              <div 
                className="absolute right-0 top-5"
                style={{
                  width: '8px',
                  height: '50px',
                  background: 'linear-gradient(to left, #92400e, #78350f)',
                  borderRadius: '0 4px 4px 0',
                  transform: 'rotateY(90deg) translateZ(15px)',
                  boxShadow: '-2px 0 5px rgba(0,0,0,0.3)'
                }}
              ></div>
              
              {/* Chair Legs - Front Left */}
              <div 
                className="absolute -bottom-3 -left-3"
                style={{
                  width: '6px',
                  height: '12px',
                  background: '#78350f',
                  borderRadius: '2px',
                  transform: 'rotateY(-45deg) translateZ(5px)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                }}
              ></div>
              
              {/* Chair Legs - Front Right */}
              <div 
                className="absolute -bottom-3 -right-3"
                style={{
                  width: '6px',
                  height: '12px',
                  background: '#78350f',
                  borderRadius: '2px',
                  transform: 'rotateY(45deg) translateZ(5px)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                }}
              ></div>
              
              {/* Chair Legs - Back Left */}
              <div 
                className="absolute -bottom-3 left-1/2"
                style={{
                  width: '6px',
                  height: '12px',
                  marginLeft: '-20px',
                  background: '#78350f',
                  borderRadius: '2px',
                  transform: 'translateZ(5px)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                }}
              ></div>
              
              {/* Chair Legs - Back Right */}
              <div 
                className="absolute -bottom-3 left-1/2"
                style={{
                  width: '6px',
                  height: '12px',
                  marginLeft: '14px',
                  background: '#78350f',
                  borderRadius: '2px',
                  transform: 'translateZ(5px)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                }}
              ></div>
            </div>
          </div>
        </div>
        
        <p className="mt-12 text-imdb-text-secondary text-sm animate-pulse">
          Finding your perfect movie...
        </p>
      </div>

    </>
  );
}
