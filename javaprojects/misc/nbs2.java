package javaprojects.misc;

public class nbs2 {
    public static void main(String[] args){
        long time = System.nanoTime();
        int n = 25;
        int b = 2;
        String s = "110000111011010101010010100";
        int c = Integer.parseInt(s, b);
        int[] freqs = new int[16];
        for(int i = c; i < c + n; i++){
            int l = (int) (Math.log(i)/Math.log(b));
            int p = (int) Math.pow(b,l);
            int t = i;
            for(int v = l-1; v>=0; v--){
                int j = (int) ((t - (t % p))/p);
                freqs[j]++;
                t-=j*p;
                p/=b;
            }
            freqs[t]++;
        }
        int m = 0;
        for(int j : freqs) m = Math.max(m,j);
        System.out.println((System.nanoTime() - time)/1e6);
        System.out.println(m);
    }
}
