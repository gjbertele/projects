package javaprojects.misc;
import java.util.ArrayList;
import java.util.Arrays;
public class primes2 {
    public static void main(String[] args){
        ArrayList<Integer> primes = new ArrayList<Integer>();
        ArrayList<Long> times = new ArrayList<Long>();
        primes.add(2);
        int t = 3;
        int ni = Integer.parseInt(args[0]);
        int c = 1;
        long j = System.nanoTime();
        out: while(t<ni){
            times.add(System.nanoTime());
            for(int i : primes){
                if(i*i > t) break;
                if(t % i == 0){
                    t+=2; continue out;
                }
            }
            primes.add(t);
            c++;
            t+=2;
        }
        System.out.println((System.nanoTime()-j)/1e6 +" - "+c+"/"+args[0]);
        int[] ts = new int[times.size()/100 + 1];
        for(int v = 0; v<times.size(); v+=100){
            ts[v/100] = (int) Math.round((times.get(v) - j)*1000/(ni*Math.sqrt(ni)/Math.log(Math.log(ni))));
        }
        //System.out.println(Arrays.toString(ts));
    } 
}