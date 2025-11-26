import MenuCategory from './MenuCategory';

interface MenuItem {
  name: string;
  price: string;
  description?: string;
}

interface Category {
  name: string;
  items: MenuItem[];
}

interface MenuSectionProps {
  title: string;
  categories: Category[];
  className?: string;
}

export default function MenuSection({ title, categories, className }: MenuSectionProps) {
  return (
    <section className={className}>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">{title}</h2>
      <div className="space-y-12">
        {categories.map((category, idx) => (
          <MenuCategory
            key={idx}
            name={category.name}
            items={category.items}
          />
        ))}
      </div>
    </section>
  );
}

