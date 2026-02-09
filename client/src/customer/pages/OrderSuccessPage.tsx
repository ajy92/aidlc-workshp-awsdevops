import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export function OrderSuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const orderNumber = (location.state as { orderNumber?: number })?.orderNumber
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/menu', { replace: true })
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">주문 완료!</h1>

        {orderNumber && (
          <p className="mb-4 text-lg text-gray-600">
            주문 번호: <span className="font-bold text-primary-600">#{orderNumber}</span>
          </p>
        )}

        <p className="mb-6 text-sm text-gray-500">
          주문이 접수되었습니다. 잠시만 기다려 주세요.
        </p>

        <p className="text-sm text-gray-400">
          {countdown}초 후 메뉴 화면으로 이동합니다
        </p>

        <button
          onClick={() => navigate('/menu', { replace: true })}
          className="mt-4 w-full rounded-lg bg-primary-600 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
        >
          메뉴로 돌아가기
        </button>
      </div>
    </div>
  )
}
