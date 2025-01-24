import { Input } from '../ui/input';

function NavSearch() {
  return (
    <Input
      className="max-w-xs dark:bg-muted "
      type="text"
      placeholder="Find a property..."
    />
  );
}

export default NavSearch;
