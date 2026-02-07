import { ReactNode } from 'react'

interface IPhone3DProps {
  children: ReactNode
}

export function IPhone3D({ children }: IPhone3DProps) {
  return (
    <div className="iphone-container">
      <div className="iphone-3d-wrapper">
        <div className="iphone-3d">
          <div className="iphone-back"></div>
          <div className="iphone-body"></div>
          <div className="iphone-frame">
            <div className="btn-volume"></div>
            <div className="btn-volume btn-volume-down"></div>
            <div className="btn-power"></div>
            <div className="iphone-screen">
              <div className="screen-reflection"></div>
              <div className="dynamic-island flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/80 mr-1 animate-pulse"></div>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
      <div className="phone-shadow"></div>
    </div>
  )
}
