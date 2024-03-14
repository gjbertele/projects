package javaprojects.misc;

public class primes {
    public static void main(String[] args){
        int n = 500000000;
        int res = 2;
        for(int v = 1; v*v<n; v++){
            res = v;
        }
        System.out.println(res);
    }
}
