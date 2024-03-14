package javaprojects.misc;

public class eratosthenes {
    public static void main(String[] args){
        int n = Integer.parseInt(args[0]);
        boolean[] list = new boolean[n+1];
        int t = 1;
        long p = System.nanoTime();
        for(int v = 2; v<n; v++){
            if(list[v] == false) t++;
            for(int j = v; j*v>0 && j*v<n; j++){
                list[j*v] = true;
            }
        }
        System.out.println(t+", "+(System.nanoTime()-p)/1e6);
    }
}
