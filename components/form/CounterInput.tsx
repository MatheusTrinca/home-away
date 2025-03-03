'use client';
import { Card, CardHeader } from '@/components/ui/card';
import { LuMinus, LuPlus } from 'react-icons/lu';

import { Button } from '../ui/button';
import { useState } from 'react';

function CounterInput({
  detail,
  defaultValue,
}: {
  detail: string;
  defaultValue?: number;
}) {
  const [count, setCount] = useState(defaultValue || 0);

  const increaseCount = () => {
    setCount(prevCount => prevCount + 1);
  };

  const decreaseCount = () => {
    setCount(prevCount => {
      if (prevCount > 0) {
        return prevCount - 1;
      }
      return prevCount;
    });
  };

  return (
    <Card className="mb-4">
      <input type="hidden" name={detail} value={count} />
      <CardHeader className="flex flex-col gapy-5">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex flex-col">
            <h2 className="font-medium capitalize">{detail}</h2>
            <p className="text-muted-foreground text-sm">
              Specify the number of {detail}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={decreaseCount}
              className="text-primary hover:text-primary"
            >
              <LuMinus />
            </Button>
            <span className="font-semibold">{count}</span>
            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={increaseCount}
              className="text-primary hover:text-primary"
            >
              <LuPlus />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

export default CounterInput;
