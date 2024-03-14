package javaprojects.misc;
import java.util.Arrays;
public class nbs {
    public static void main(String[] args){
        int n = 20;
        int b = 12;
        String s = "9AB";
        int[] freqs = new int[16]; 

        long convertedFromBase = 0;
        int currentIndex = s.length()-1;
        long power = 1;
        while(currentIndex >= 0){
            char index = s.charAt(currentIndex);
            if(index <= '9'){
                convertedFromBase += power*(index - '0'); 
            } else {
                convertedFromBase += power*(index - 'A' + 10); 
            }
            power *= b;
            currentIndex--; 
        }


        for(long i = convertedFromBase; i < convertedFromBase+n; i++){
            int l = (int) (Math.log(i)/Math.log(b)); 
            long pow = (long) Math.pow(b, l);
            long temporaryI = i;
            for(int v = l - 1; v >= 0; v--){
                int j = (int) ((temporaryI - (temporaryI % pow))/pow); 
                freqs[j]++;
                temporaryI -= j*pow;
                pow /= b;
            }
            freqs[(int) temporaryI]++; 
        }
        System.out.println(Arrays.toString(freqs));


        int m = 0;
        for(int k : freqs) m = Math.max(m,k); //find max value of frequencies
        
        System.out.println(m);
    }
}
