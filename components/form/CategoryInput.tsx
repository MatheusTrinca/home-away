import { Prisma } from '@prisma/client';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { categories } from '@/utils/categories';

const name = Prisma.PropertyScalarFieldEnum.category;

function CategoryInput({ defaultValue }: { defaultValue?: string }) {
  const name = 'category';
  return (
    <div className="mb-2">
      <Label htmlFor={name} className="capitalize">
        Category
      </Label>
      <Select
        name={name}
        defaultValue={defaultValue || categories[0].label}
        required
      >
        <SelectTrigger id={name}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categories.map(category => (
            <SelectItem key={category.label} value={category.label}>
              <span className="flex items-center gap-2">
                <category.icon /> {category.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default CategoryInput;
