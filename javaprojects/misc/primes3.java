package javaprojects.misc;

public class primes3 {
    public static void main(String[] args){
        int t = 3;
        int c = 1;
        double j = System.nanoTime();
        out: while(t<Integer.parseInt(args[0])){
            for(int v = 3; v*v<=t; v+=2){
                if(t % v == 0){
                    t+=2;
                    continue out;
                }
            }
            t+=2;
            c++;
        }
        System.out.println((System.nanoTime() - j)/1e6+" - "+c+"/"+args[0]);
    }
}
