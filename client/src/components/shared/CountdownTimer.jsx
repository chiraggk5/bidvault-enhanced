import { useCountdown } from '../../hooks/useCountdown'

export default function CountdownTimer({ endsAt, compact = false }) {
  const { days, hours, minutes, seconds, isUrgent, isEnded } = useCountdown(endsAt)

  if (isEnded) return (
    <span className="text-slate-400 text-sm font-medium">Auction Ended</span>
  )

  if (compact) return (
    <span className={`font-mono font-bold text-sm ${isUrgent ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
      {days > 0 ? `${days}d ${hours}h` : `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`}
    </span>
  )

  return (
    <div className={`flex gap-2 ${isUrgent ? 'text-red-400' : 'text-white'}`}>
      {days > 0 && (
        <div className="text-center">
          <div className="text-xl font-bold font-mono bg-white/10 rounded-lg px-3 py-1">{days}</div>
          <div className="text-xs text-white/50 mt-1">days</div>
        </div>
      )}
      <div className="text-center">
        <div className={`text-xl font-bold font-mono rounded-lg px-3 py-1 ${isUrgent ? 'bg-red-500/20' : 'bg-white/10'}`}>{String(hours).padStart(2,'0')}</div>
        <div className="text-xs text-white/50 mt-1">hrs</div>
      </div>
      <div className="text-white/40 text-xl font-bold mt-1">:</div>
      <div className="text-center">
        <div className={`text-xl font-bold font-mono rounded-lg px-3 py-1 ${isUrgent ? 'bg-red-500/20' : 'bg-white/10'}`}>{String(minutes).padStart(2,'0')}</div>
        <div className="text-xs text-white/50 mt-1">min</div>
      </div>
      <div className="text-white/40 text-xl font-bold mt-1">:</div>
      <div className="text-center">
        <div className={`text-xl font-bold font-mono rounded-lg px-3 py-1 ${isUrgent ? 'bg-red-500/20 animate-pulse' : 'bg-white/10'}`}>{String(seconds).padStart(2,'0')}</div>
        <div className="text-xs text-white/50 mt-1">sec</div>
      </div>
    </div>
  )
}
