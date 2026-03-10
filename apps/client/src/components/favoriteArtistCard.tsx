import { useFavoriteArtist } from '../hooks/useFavoriteArtist';
import { ArtisticCard } from './artisticCard';
import { useNavigate } from 'react-router-dom';

export interface FavoriteArtistCardProps {
  startDate: Date | null;
  endDate: Date | null;
}

export function FavoriteArtistCard({ startDate, endDate }: FavoriteArtistCardProps) {
  const { data, loading } = useFavoriteArtist(startDate, endDate);
  const navigate = useNavigate();

  const backgroundImageUrl = data?.artist.images?.[0]?.url;

  return (
    <ArtisticCard
      title="Top Artist"
      loading={loading}
      backgroundImageUrl={backgroundImageUrl}
      emphasizedText={data ? data.artist.name : undefined}
      detailsText={data ? `${data.count} Listens` : undefined}
      onClick={data ? () => navigate(`/artist/${data.artist.id}`) : undefined}
    />
  );
}
