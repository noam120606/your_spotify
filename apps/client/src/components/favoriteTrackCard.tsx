import { useFavoriteTrack } from '../hooks/useFavoriteTrack';
import { ArtisticCard } from './artisticCard';
import { useNavigate } from 'react-router-dom';

export interface FavoriteTrackCardProps {
  startDate: Date | null;
  endDate: Date | null;
}

export function FavoriteTrackCard({ startDate, endDate }: FavoriteTrackCardProps) {
  const { data, loading } = useFavoriteTrack(startDate, endDate);
  const navigate = useNavigate();

  const backgroundImageUrl = data?.album?.images?.[0]?.url;

  return (
    <ArtisticCard
      title="Top Song"
      loading={loading}
      backgroundImageUrl={backgroundImageUrl}
      emphasizedText={data?.track.name}
      detailsText={data ? `${data.artist?.name || 'Unknown Artist'} • ${data.count} Listens` : undefined}
      onClick={data ? () => navigate(`/track/${data.track.id}`) : undefined}
    />
  );
}
