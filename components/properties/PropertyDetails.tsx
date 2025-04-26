import { formatQuantity } from '@/utils/format';

type PropertyDetailsProps = {
  details: {
    bedrooms: number;
    baths: number;
    guests: number;
    beds: number;
  };
};

function PropertyDetails({
  details: { bedrooms, baths, guests, beds },
}: PropertyDetailsProps) {
  return (
    <p className="text-md font-light">
      <span>{formatQuantity(beds, 'bed')} &middot; </span>
      <span>{formatQuantity(baths, 'bath')} &middot; </span>
      <span>{formatQuantity(guests, 'guest')} &middot; </span>
      <span>{formatQuantity(bedrooms, 'bedroom')}</span>
    </p>
  );
}

export default PropertyDetails;
