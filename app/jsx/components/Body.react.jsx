module React from 'react';

function *range(begin, end) {
  for (let i = begin; i < end; ++i){
    yield i;
  }
}

class _Body {
  buzzWord(n, w = n.toString()) {
    if(!(n%3) || !(n%5)){
      w = (n % 3 ? '' : 'fizz') + (n % 5 ? '' : 'buzz');
    }

    return w;
  }

  fizzBuzz(max = 100) {
    return [for (n of range(1, max)) this.buzzWord(n)];
  }

  render() {
    return (
      <div>
        {
          this.fizzBuzz().map((r,n) => {
            return <p key={n}>{r}</p>
          })
        }
      </div>
    );
  }
}

export const Body = React.createClass(_Body.prototype);
