import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'

const seats = (() => {
  const rows = 12
  const cols = ['A','B','C','D']
  const out = []
  for (let r=1;r<=rows;r++) {
    for (const c of cols) out.push(`${r}${c}`)
  }
  return out
})()

export default function FocusFlight() {
  const navigate = useNavigate()
  const { isSignedIn } = useUser()
  const { getToken } = useAuth()
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const [airports, setAirports] = useState([])
  const [source, setSource] = useState('SFO')
  const [destination, setDestination] = useState('LAX')
  const [seat, setSeat] = useState('1A')
  const [minutes, setMinutes] = useState(25)

  const [session, setSession] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    axios.get(backendUrl + '/api/focus/airports').then(({data}) => {
      if (data.success) setAirports(data.airports)
    })
  }, [backendUrl])

  useEffect(() => {
    if (!session || session.status !== 'in_progress') return
    const endAt = new Date(session.startTime).getTime() + session.durationMinutes*60*1000
    const id = setInterval(() => {
      const now = Date.now()
      setTimeLeft(Math.max(0, Math.ceil((endAt - now)/1000)))
    }, 1000)
    return () => clearInterval(id)
  }, [session])

  const progress = useMemo(() => {
    if (!session || !session.startTime) return 0
    const start = new Date(session.startTime).getTime()
    const end = start + session.durationMinutes*60*1000
    const now = Date.now()
    return Math.min(1, Math.max(0, (now - start) / (end - start)))
  }, [session, timeLeft])

  const startFocus = async () => {
    if (!isSignedIn) return navigate('/')
    const token = await getToken()
    const { data } = await axios.post(backendUrl + '/api/focus/sessions', {
      sourceCode: source,
      destinationCode: destination,
      seat,
      durationMinutes: minutes
    }, { headers: { Authorization: `Bearer ${token}` } })
    if (data.success) {
      const created = data.session
      const startRes = await axios.post(backendUrl + `/api/focus/sessions/${created._id}/start`, {}, { headers: { Authorization: `Bearer ${token}` } })
      if (startRes.data.success) setSession(startRes.data.session)
    }
  }

  const completeFocus = async () => {
    const token = await getToken()
    await axios.post(backendUrl + `/api/focus/sessions/${session._id}/complete`, {}, { headers: { Authorization: `Bearer ${token}` } })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {!session && (
        <div className="grid gap-4">
          <h2 className="text-2xl font-semibold">Plan your focus flight</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm">Source</label>
              <select value={source} onChange={e=>setSource(e.target.value)} className="w-full border rounded p-2">
                {airports.map(a => (
                  <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm">Destination</label>
              <select value={destination} onChange={e=>setDestination(e.target.value)} className="w-full border rounded p-2">
                {airports.map(a => (
                  <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm">Seat</label>
              <div className="grid grid-cols-8 gap-2 max-h-40 overflow-auto border p-2 rounded">
                {seats.map(s => (
                  <button key={s} onClick={()=>setSeat(s)} className={`text-sm border rounded py-1 ${seat===s? 'bg-blue-600 text-white':'bg-white'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm">Duration (minutes)</label>
              <input type="number" min={5} max={240} value={minutes} onChange={e=>setMinutes(Number(e.target.value))} className="w-full border rounded p-2" />
            </div>
          </div>
          <button onClick={startFocus} className="bg-blue-600 text-white px-4 py-2 rounded w-fit">Get boarding pass</button>
        </div>
      )}

      {session && (
        <div className="grid gap-6">
          <div className="border p-4 rounded">
            <h3 className="font-semibold mb-2">Boarding pass</h3>
            <div className="flex flex-wrap gap-6 text-sm">
              <div><div className="text-gray-500">PNR</div><div className="font-semibold">{session.pnr}</div></div>
              <div><div className="text-gray-500">From</div><div className="font-semibold">{session.sourceCode}</div></div>
              <div><div className="text-gray-500">To</div><div className="font-semibold">{session.destinationCode}</div></div>
              <div><div className="text-gray-500">Seat</div><div className="font-semibold">{session.seat}</div></div>
              <div><div className="text-gray-500">Duration</div><div className="font-semibold">{session.durationMinutes}m</div></div>
              <div><div className="text-gray-500">Status</div><div className="font-semibold">{session.status}</div></div>
            </div>
          </div>

          {session.status === 'in_progress' && (
            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-3">In-flight focus</h3>
              <RouteProgress airports={airports} from={session.sourceCode} to={session.destinationCode} progress={progress} />
              <div className="mt-3 text-sm">Time left: <b>{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</b></div>
              <button onClick={completeFocus} className="mt-3 bg-green-600 text-white px-3 py-2 rounded">Mark complete</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RouteProgress({ airports, from, to, progress }) {
  const src = airports.find(a=>a.code===from)
  const dst = airports.find(a=>a.code===to)
  if (!src || !dst) return null
  return (
    <div className="w-full h-40 bg-sky-50 border rounded relative overflow-hidden">
      <svg viewBox="0 0 100 40" className="w-full h-full">
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#0ea5e9" />
          </marker>
        </defs>
        <circle cx="10" cy="30" r="2" fill="#0ea5e9" />
        <text x="10" y="36" fontSize="3" textAnchor="middle">{from}</text>
        <circle cx="90" cy="10" r="2" fill="#0ea5e9" />
        <text x="90" y="6" fontSize="3" textAnchor="middle">{to}</text>
        <line x1="10" y1="30" x2="90" y2="10" stroke="#0ea5e9" strokeWidth="0.8" strokeDasharray="2,2" />
        <g>
          <line x1="10" y1="30" x2={10 + 80*progress} y2={30 - 20*progress} stroke="#0ea5e9" strokeWidth="1.6" markerEnd="url(#arrow)" />
        </g>
      </svg>
    </div>
  )
}
