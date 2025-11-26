import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/Card';

interface MenuItem {
  name: string;
  price: string;
  description?: string;
}

interface MenuCategoryProps {
  name: string;
  items: MenuItem[];
  className?: string;
}

export default function MenuCategory({ name, items, className }: MenuCategoryProps) {
  return (
    <Card variant="default" className={cn('animate-fade-in', className)}>
      <CardContent className="p-6 md:p-8">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 pb-3 border-b border-[#2D2D44]/50">
          {name}
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-white mb-1">{item.name}</h4>
                {item.description && (
                  <p className="text-white/70 text-sm">{item.description}</p>
                )}
              </div>
              <div className="text-xl font-bold text-[#A78BFA] whitespace-nowrap">
                {item.price}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

